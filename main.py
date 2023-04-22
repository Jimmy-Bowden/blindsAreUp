from functools import total_ordering
import time
import datetime
import json
import tkinter
from tkinter import *
from xml.etree.ElementTree import tostring
from playsound import playsound

file = open("blinds.json")
data = json.load(file)
file.close()

state = {
    "smallBlind": data[0]['small_blind'],
    "bigBlind": data[0]['big_blind'],
    "blindDurationMinutes": 30, 
    "pauseTimer": 0, #In seconds
    "currentTimer": 0, #In seconds
    "currentRound": 0,
    "maxRounds": len(data),
    "pauseTimerFlag": False,
}


def getSmallBlindText(state):
    return "Small Blind: " + str(state['smallBlind'])

def getBigBlindText(state):
    return "Big Blind:     " + str(state['bigBlind'])

def getCurrentTimerText(state):
    return datetime.timedelta(seconds = state['currentTimer'])

def countdown(state):
    while state['currentTimer'] > 0:
        if(state['pauseTimerFlag'] == True):
            # pauseTimerFlag = False
            return
        timer = datetime.timedelta(seconds = state['currentTimer'])
        timerLabel.config(text=timer)
        master.update()
        time.sleep(1)
        state['currentTimer'] -= 1
    
    print("Blinds are up!")
    playsound('timer.mp3')
    state['currentRound'] += 1
    startRound(state)

def startRound(state):
    state['smallBlind']=data[state['currentRound']]['small_blind']
    state['bigBlind']=data[state['currentRound']]['big_blind']
    state['currentTimer']=state['blindDurationMinutes'] * 60
    state['pauseTimerFlag']=False
    smallblindText = getSmallBlindText(state)
    bigBlindText = getBigBlindText(state)

    smallBlindLabel.config(text=smallblindText)
    bigBlindLabel.config(text=bigBlindText)
    master.update()

    countdown(state)

def tooglePauseTimer(state):
    if(state['pauseTimerFlag']):
        state['pauseTimerFlag'] = False
        pauseButton.config(text="Pause")
        countdown(state)
    else:
        state['pauseTimerFlag'] = True
        pauseButton.config(text="Unpause")
        countdown(state)

def unpauseTimer(state):
    state['pauseTimerFlag'] = False
    countdown(state)

def nextBlind(state):
    if(state['currentRound'] < state['maxRounds']):
        state['currentRound'] += 1
        restartBlindTimer(state)
        startRound(state)
    else:
        print("Can't go past the max rounds")

def previousBlind(state):
    if(state['currentRound'] > 0):
        state['currentRound'] -= 1
        restartBlindTimer(state)
        startRound(state)
    else:
        print("Can't go into negative rounds")

def restartBlindTimer(state):
    state['currentTimer'] = state['blindDurationMinutes'] * 60
    timerLabel.config(text=getCurrentTimerText(state))

def restartGame(state):
    state['pauseTimerFlag'] = True
    restartBlindTimer(state)
    state['currentRound'] = 0
    state['smallBlind'] = data[0]["small_blind"]
    state['bigBlind'] = data[0]["big_blind"]
    state['pauseTimerFlag']=False
    pauseButton.config(text="Pause")
    smallBlindLabel.config(text=getSmallBlindText(state))
    bigBlindLabel.config(text=getBigBlindText(state))


master = tkinter.Tk()

canvas_height=1080
canvas_width=1920

master.geometry(str(canvas_height)+"x"+str(canvas_width))
master.title="Blinds Are Up Timer"

parentFrame = Frame(master, width=canvas_width, height=canvas_height)
parentFrame.pack()

labelFrame = Frame(parentFrame, width=canvas_width, height=canvas_height/2)
labelFrame.pack(side = TOP)

buttonFrame = Frame(parentFrame, width=canvas_width, height=canvas_height/2)
buttonFrame.pack(side = BOTTOM)

blindValueFrame = Frame(labelFrame, width=canvas_width, height=canvas_height/4)
blindValueFrame.pack(side = TOP)

timerFrame = Frame(labelFrame, width=canvas_width, height=canvas_height/4)
timerFrame.pack(side = BOTTOM)

smallBlindLabel = Label(blindValueFrame, text=getSmallBlindText(state))
smallBlindLabel.config(font=('Helvatical bold',100))
smallBlindLabel.pack(side = TOP)

bigBlindLabel = Label(blindValueFrame, text=getBigBlindText(state))
bigBlindLabel.config(font=('Helvatical bold',100))
bigBlindLabel.pack(side = BOTTOM)

timerLabel = Label(timerFrame, text=str(datetime.timedelta(seconds = state['blindDurationMinutes'] * 60)))
timerLabel.config(font=('Helvatical bold',300))
timerLabel.pack(side = BOTTOM)

startBlindsButton = tkinter.Button(buttonFrame, text='Start Game', width=25, command=lambda: startRound(state))
startBlindsButton.pack(side = TOP)

restartGameButton = tkinter.Button(buttonFrame, text='Restart Game', width=25, command=lambda: restartGame(state))
restartGameButton.pack(side = BOTTOM)

pauseButton = tkinter.Button(buttonFrame, text="Pause", width=25, command=lambda: tooglePauseTimer(state))
pauseButton.pack(side = LEFT)

master.mainloop()


