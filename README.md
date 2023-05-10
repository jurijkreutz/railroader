# Railroader

<p align="center"><img width="1012" alt="Screenshot 2023-05-10 at 13 10 16" src="https://github.com/jurijkreutz/railroader/assets/104159382/693aae5c-2cd9-4433-accc-9d2c5750e37d"></p>

<p align="center">Railroader is a game built on vanilla Javascript, HTML and some CSS magic. Players have to connect cities with railroads. After some time, more and more cities notice, how awesome it is to have a train station - so they want a rail connection to!</p>

<p align="center">As a Player, you are responsible for connecting all cities that want a train station to your network and add trains to your lines.</p>

<p align="center"><img width="1011" alt="Screenshot 2023-05-10 at 13 10 52" src="https://github.com/jurijkreutz/railroader/assets/104159382/e87eafb1-a589-461d-8502-6fa49e37acdb"></p>

<b>You loose, if</b>
- a station is overcrowded.
- a city has been waiting for too long to get a train connection.

## Screenshots

<img width="1009" alt="start" src="https://github.com/jurijkreutz/railroader/assets/104159382/a1b7adb6-ca98-451a-829f-f7e6a07277b2">
<img width="1013" alt="Screenshot 2023-05-10 at 13 19 15" src="https://github.com/jurijkreutz/railroader/assets/104159382/ab8076f9-18da-44e7-bf5e-353ddf8cf914">
<img width="1001" alt="Screenshot 2023-05-10 at 13 20 32" src="https://github.com/jurijkreutz/railroader/assets/104159382/7f0bd363-42e8-4c89-97e0-e9fa953faadb">

## How to play

> Since Railroader is partly built on CSS animations, always keep the Tab open while playing to avoid weird behaviour.

- If you want to connect two cities, first click on one circle and then on the other.
- You can add stations to a line if you click on one ending station of the line and on another circle.
- You cannot add stations in the middle of a line (only on the ends).

At the beginning, it's very important to have enough money to be able to expand your network. After some time, you can also think about buying trains.

The amount of passengers is linearly increasing, but it plateaus after some time.

If a station gets crowded, it turns yellow and a red bar appears - if that red bar is full, the station got overcrowded and you loose.

## Run game

1. Clone the project

```ssh
git clone git@github.com:jurijkreutz/railroader.git
```

2. Navigate to the directory
3. Start a local web server and run the game. If you have Python installed:

```ssh
python -m http.server
```

4. Open your preferred web browser and visit http://localhost:8000 or http://127.0.0.1:8000
5. Start playing :)

## Known Bugs

- Weird Behaviour if switching tabs (always keep website in foreground while playing)
- Trains sometimes glitching and driving between two not-connected cities
