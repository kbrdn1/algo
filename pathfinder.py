import sys
from PyQt5.QtWidgets import QApplication, QWidget, QGridLayout, QVBoxLayout, QPushButton, QLabel, QMessageBox
from PyQt5.QtCore import Qt
import random
import heapq

# Map Setup (Grid as Graph)
def generate_grid(size=10):
    grid = []
    obstacle_count = random.randint(1, size*size//8)
    for i in range(size):
        grid.append([random.randint(0, 2) for _ in range(size)])
    for i in range(obstacle_count):
        grid[random.randint(0, size-1)][random.randint(0, size-1)] = 2
    return grid

def pathfinder(grid, start, goal, obstacle_value=2):
    """
    A* pathfinding algorithm
    
    Parameters:
        grid (list of lists): A 2D grid where each element is a cost (>=1) or obstacle_value for obstacles.
        start (tuple): Starting coordinate (row, col).
        goal (tuple): Goal coordinate (row, col).
        obstacle_value: Value in grid that represents obstacles
    
    Returns:
        list: The path from start to goal as a list of coordinates, or None if no path is found.
    """
    rows = len(grid)
    cols = len(grid[0])
    
    # Define the valid moves (up, right, down, left, and diagonals)
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]
    
    # Initialize the open and closed sets
    open_set = []
    closed_set = set()
    
    # Dictionary to store the parent of each node
    came_from = {}
    
    # Dictionary to store the g-score (cost from start to node)
    g_score = {start: 0}
    
    # Dictionary to store the f-score (g-score + heuristic)
    f_score = {start: manhattan_distance(start, goal)}
    
    # Add the start node to the open set
    heapq.heappush(open_set, (f_score[start], start))
    
    while open_set:
        # Get the node with the lowest f-score
        current_f, current = heapq.heappop(open_set)
        
        # If we've reached the goal, reconstruct and return the path
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path
        
        # Add the current node to the closed set
        closed_set.add(current)
        
        # Check all neighbors
        for dx, dy in directions:
            neighbor = (current[0] + dx, current[1] + dy)
            
            # Skip if out of bounds
            if not (0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols):
                continue
            
            # Skip if the neighbor is an obstacle
            if grid[neighbor[0]][neighbor[1]] == obstacle_value:
                continue
            
            # Skip if the neighbor is already in the closed set
            if neighbor in closed_set:
                continue
            
            # Calculate the tentative g-score
            tentative_g = g_score[current] + 1  # Assuming a cost of 1 to move to adjacent cells
            
            # If the neighbor is not in the open set or the tentative g-score is better
            if neighbor not in [i[1] for i in open_set] or tentative_g < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + manhattan_distance(neighbor, goal)
                
                # Add the neighbor to the open set
                heapq.heappush(open_set, (f_score[neighbor], neighbor))
    
    # No path found
    return None

def manhattan_distance(a, b):
    """Calculate the Manhattan distance between two points."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

class GridWindow(QWidget):
    colors = {
        0: "green",
        1: "darkgreen",
        2: "black"
    }
    def __init__(self, grid, cell_size, start, goal):
        super().__init__()
        self.start = start
        self.goal = goal
        self.grid = grid
        self.cell_size = cell_size
        self.setWindowTitle("Pathfinder")
        
        # Main vertical layout for the entire window
        self.main_layout = QVBoxLayout(self)
        
        # Create a grid layout for the cells with 1-pixel spacing
        self.grid_layout = QGridLayout()
        self.grid_layout.setSpacing(1)
        self.create_grid()
        
        # Wrap the grid layout in a widget and add it to the main layout
        grid_widget = QWidget()
        grid_widget.setLayout(self.grid_layout)
        self.main_layout.addWidget(grid_widget)
        
        # Create a button, plug the callback, and add it at the bottom
        self.button = QPushButton("Find Path")
        self.button.clicked.connect(self.on_button_clicked)
        self.main_layout.addWidget(self.button)

    def create_grid(self, path=None):
        if path is None:
            path = []
            
        # Clear existing grid items if any
        while self.grid_layout.count():
            item = self.grid_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()
                
        grid = self.grid
        ROWS = len(grid)
        COLS = len(grid[0])
        for row in range(ROWS):
            for col in range(COLS):
                label = "X" if (row, col) in path else ""
                cell = QLabel(label)
                cell.setFixedSize(self.cell_size, self.cell_size)  # Makes the cell square
                cell.setAlignment(Qt.AlignCenter)
                if (row, col) == self.start:
                    cell.setStyleSheet("border: 1px solid black; background-color: blue;")
                elif (row, col) == self.goal:
                    cell.setStyleSheet("border: 1px solid black; background-color: red;")
                elif (row, col) in path:
                    cell.setStyleSheet("border: 1px solid black; background-color: yellow;")
                else:
                    cell.setStyleSheet(f"border: 1px solid black; background-color: {self.colors[grid[row][col]]};")
                self.grid_layout.addWidget(cell, row, col)

    def on_button_clicked(self):
        """Run the Pathfinding algorithm and redraw the grid with the resulting path."""
        path = pathfinder(self.grid, self.start, self.goal)
        if path:
            self.create_grid(path)
        else:
            QMessageBox.warning(self, "No Path", "No path found.")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    # Generate a grid and set start/goal positions
    grid_size = 20
    grid = generate_grid(grid_size)
    start = (0, 0)
    goal = (random.randint(1, grid_size-1), random.randint(1, grid_size-1))
    grid[start[0]][start[1]] = 0  # Ensure start is not an obstacle
    grid[goal[0]][goal[1]] = 0    # Ensure goal is not an obstacle
    
    window = GridWindow(grid, cell_size=40, start=start, goal=goal)
    window.show()
    sys.exit(app.exec_())
