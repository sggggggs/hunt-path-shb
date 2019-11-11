import tsp
import json

AETHERYTE_COST = 8
Z_SCALE = 4

def distance(p1, p2):
    return ((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2 + (Z_SCALE * (p1[2] - p2[2]))**2)**0.5

def generate_graph(zone):
    graph = []

    for teleport1 in zone["teleports"]:
        distances = []
        for teleport2 in zone["teleports"]:
            distances.append(0 if teleport1 is teleport2 else 1)
        for spawn2 in zone["spawns"]:
            distances.append(distance(teleport1, spawn2))
        graph.append(distances)
    
    for spawn1 in zone["spawns"]:
        distances = []
        for teleport in zone["teleports"]:
            distances.append(AETHERYTE_COST)
        for spawn2 in zone["spawns"]:
            distances.append(distance(spawn1, spawn2))
        graph.append(distances)

    return graph

def shortest_path(graph):
    r = range(len(graph))
    distances = {(i, j): graph[i][j] for i in r for j in r}
    return tsp.tsp(r, distances)[1]

def temp(arr, i):
    arr.append(i)
    return arr

def map_nodes(path, zone):
    nodes = []
    nodes.extend(zone["teleports"])
    nodes.extend(zone["spawns"])
    return [temp(nodes[i], int(i)) for i in path]

zones = {}
with open("zones.json") as f:
    zones = json.load(f)

output = {}
for name, zone in zones.items():
    graph = generate_graph(zone)
    path_indices = shortest_path(graph)
    path_nodes = map_nodes(path_indices, zone)
    output[name] = { "marks": zone["marks"], "path": path_nodes }

with open("paths.json", "w+") as f:
    json.dump(output, f)