# **Portland Vandal Map**

## **Author:** Alister Fenix  @AFenix

### **Project Description**
This interactive Leaflet map project visualizes incidents of vandalism in Portland, Oregon, from 2015 to 2023. Developed for the GEOG575: Interactive Cartography & Geovisualization course, it aims to enhance geovisualization skills and understanding through hands-on mapping practices. By summarizing vandalism data by neighborhood, this map provides a unique lens through which to view urban crime dynamics.

### **Feedback & Contributions**
I welcome your insights and suggestions to improve this project. Specifically, I'm interested in feedback on:
1. Improvements in data representation, operator use, and styling.
2. Suggestions for additional features or user interactions.
3. Ideas on how to better implement UX/UI design principles.

### **Dependencies**
- [Leaflet 1.9.4](https://leafletjs.com/2022/09/21/leaflet-1.9.0.html) for map creation and interaction.
- [Leaflet Search Plugin](https://github.com/stefanocudini/leaflet-search) to enable the neighborhood location search feature within the map.


### **Project Structure**
The repository organizes the project as follows:

- `index.html`: Hosts the Leaflet map and structures the interactive elements and content.
- `js/main.js`: JavaScript logic for the Leaflet map, geoJSON data loading, and custom interactive features.
- `css/style.css`: Custom styles for map and webpage elements, enhancing aesthetics and usability.
- `data/crime15_23.geojson`: GeoJSON dataset of vandalism and related crimes in Portland from 2015-2023, courtesy of the Portland Police Bureau. [View Source](https://public.tableau.com/app/profile/portlandpolicebureau/viz/New_Monthly_Neighborhood/MonthlyOffenseTotals)
- `lib/`: Directory for "leaflet" and "leaflet-search" dependencies
- `img`: Directory for image files


### **Getting Started**
To explore the *Portland Vandal Map*:

1. Clone or download this repository.
2. Open the project in a code editor or IDE (e.g., Visual Studio Code, Atom, Sublime Text).
3. **Launch a Local Server:**
    - **Using Python:**
        - Ensure Python is installed ([download here](https://www.python.org/downloads/)).
        - Navigate to the project directory in a terminal or command prompt.
        - Run `python3 -m http.server` (or `python -m SimpleHTTPServer` for Python 2).
        - Visit `http://localhost:8000/index.html` in your browser (adjust the port number as necessary).
    - **Using an IDE Extension:**
        - Many IDEs offer server extensions (e.g., "Live Server" for Visual Studio Code).
        - Install the appropriate extension and follow its instructions to start the server and open the project in your browser.


### **Features & Highlights**
- **Interactive Exploration**: Navigate through time and space to uncover patterns of vandalism across Portland's neighborhoods.
- **Data-Driven Insights**: Powered by the `crime15_23.geojson` dataset, each map point invites further investigation into the specifics of urban vandalism.
- **Educational Resource**: Designed as both a research tool and a learning aid, emphasizing the evolving nature of urban crime data and encouraging community-driven updates and corrections.