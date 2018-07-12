// import 'aframe';

import React, { Component } from 'react';
// import {Entity, Scene} from 'aframe-react';
import classNames from 'classnames';
import { Header, Icon, Menu, Container, Grid, Button, Dropdown } from 'semantic-ui-react'

import ThreeManager from './ThreeManager';
import ThreeARManager from './ThreeARManager';

import './App.css';

const shoes = {
  'testShoe': {
    brand: 'Diadora',
    model: 'Mythos BluShield Fly Hip',
    price: 125.00,
    geometry: {
      obj: 'assets/converse.obj',
      fbx: 'assets/converse.fbx',
      mtl: 'assets/converse.mtl',
    },
    versions: {
      'red': {
        name: 'Red',
        color: '#F00'
      },
      'blue': {
        name: 'Blue',
        color: '#00F'
      }
    },
    sizes: {
      '10': {
      },
      '11': {
      }
    }
  },
  'testShoeB': {
    brand: 'Diadora',
    model: 'Mythos BluShield Fly Hip',
    price: 125.00,
    geometry: {
      obj: 'assets/converse.obj',
      fbx: 'assets/converse.fbx',
      mtl: 'assets/converse.mtl',
    },
    versions: {
      'red': {
        name: 'Red',
        color: '#F00'
      },
      'blue': {
        name: 'Blue',
        color: '#00F'
      }
    },
    sizes: {
      '10': {
      },
      '11': {
      }
    }
  }
}

class ShoeDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shoe: undefined,
      shoeId: null,
    }
  }

  componentDidMount() {
    this.updateState();
  }

  componentDidUpdate() {
    const { shoeId } = this.props;
    if(shoeId && shoeId !== this.state.shoeId) {
      this.updateState();
    }
  }

  updateState() {
    const { shoe, shoeId } = this.props;
    this.setState({
      shoe,
      shoeId,
    })
  }

  render() {
    const { shoe, shoeId } = this.state;
    return shoeId ?
      <div className="ShoeView-details">
        <Grid padded>
          <Grid.Column width={16}>
            <Header as="h3">
              <Header.Subheader>
                {shoe.brand}
              </Header.Subheader>
              {shoe.model}
            </Header>
            <div className="Shoe-description">
              {Object.keys(shoe.versions).length} versions | {Object.keys(shoe.sizes).length} sizes 
            </div>
            <Button color="teal">
              Buy - ${shoe.price}
            </Button>
          </Grid.Column>
        </Grid>
      </div> : null
  }
}

class Shoe extends Component {
  componentDidMount() {
    this.updateThree();
  }

  componentDidUpdate(prevProps) {
    if (this.props.shoeId !== prevProps.shoeId) {
      this.updateThree();
    }
  }

  updateThree() {
    const { shoe, shoeId } = this.props;
    ThreeManager.createShoeScene(this.modelContainerElement, shoeId, shoe);
  }

  handleViewClick = () => {
    this.props.handleViewClick(this.props.shoeId);
  }

  render() {
    const { shoe, shoeId } = this.props;
    return (
      <Grid.Row>
        <Grid.Column width={6}>
          <div className="Shoe-modelContainer" id={`modelContainer-${shoeId}`} ref={element => this.modelContainerElement = element}>
          </div>
        </Grid.Column>
        <Grid.Column width={10}>
          <Header as="h3">
            <Header.Subheader>
              {shoe.brand}
            </Header.Subheader>
            {shoe.model}
          </Header>
          <div className="Shoe-description">
            {Object.keys(shoe.versions).length} versions | {Object.keys(shoe.sizes).length} sizes 
          </div>
          <div>
            <Button color="teal">
              Buy - ${shoe.price}
            </Button>
            <Button onClick={this.handleViewClick}>
              View
            </Button>
          </div>
        </Grid.Column>
      </Grid.Row>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeShoe: null,
      arMode: false,
    }
  }

  handleViewClick = shoeId => {
    this.setState({
      activeShoe: shoeId,
      arMode: shoeId ? this.state.arMode : false,
    })
    ThreeManager.setActiveShoe(shoeId);
  }

  handleHomeClick = () => {
    this.handleViewClick(null);
  }
  
  handleARModeClick = () => {
    this.setState({
      arMode: true,
    });
    this.arManager = new ThreeARManager();
    this.arManager.initializeThreeAR(this.arTarget, shoes[this.state.activeShoe]);
  }

  handle3DModeClick = () => {
    this.setState({
      arMode: false,
    });
    
  }

  render() {
    const {activeShoe, arMode} = this.state;
    return (
      <div className="App">
        <Menu className="AppMenu" inverted fixed="top">
          <Menu.Item onClick={this.handleHomeClick}>
            Snag
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item icon>
              <Icon name="user circle"/>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <div id="ShoeViewerAR" ref={element => this.arTarget = element}></div>
        <div className="App-bodyContainer">
          <Container className={classNames("AppList-container", {active: !this.state.activeShoe})}>
            {/* <Scene vr-mode-ui="enabled: false">
              <Entity position="0 1.6 0" camera></Entity>
              {
                Object.keys(shoes).map((shoeId, i) => {
                  const shoe = shoes[shoeId];
                  return (
                    <Entity
                      look-controls
                      geometry={{primitive: 'box', width: 1}}
                      material={{color: shoe.versions['red'].color, roughness: 0.5, src: 'uv_test.png'}}
                      scale={{x: .5, y: .5, z: .5}}
                      position={{x: -1.8, y: 4.4 - 1.4 * i, z: -5}}/>
                  )
                })
              }
            </Scene> */}
            <Grid divided="vertically" padded="vertically">
            {
              Object.keys(shoes).map(shoeId => {
                const shoe = shoes[shoeId];
                return (
                  <Shoe shoe={shoe} shoeId={shoeId} key={shoeId} handleViewClick={this.handleViewClick}/>
                )
              })
            }
            </Grid>
          </Container>
          <div id="ShoeView" className={classNames("ShoeView-container", {active: activeShoe})}>
            <div id="ShoeViewer" ref={element => ThreeManager.setShoeViewer(element)}></div>
            <div className="ShoeView-actions">
              <Button.Group basic className="ShoeView-toggles">
                <Button active={!arMode} onClick={this.handle3DModeClick}>3D</Button>
                <Button active={arMode} onClick={this.handleARModeClick}>AR</Button>
              </Button.Group>
              { arMode ? (
                <Button.Group basic className="ShoeView-views">
                  <Button active>On Ground</Button>
                  <Button>Worn</Button>
                </Button.Group>
              ) : (
                <Dropdown basic upward button placeholder='Switch View' selection options={[
                  { key: "front", value: "front", text: "Front" },
                  { key: "rear", value: "rear", text: "Rear" },
                  { key: "left", value: "left", text: "Left" },
                  { key: "right", value: "right", text: "Right" },
                  { key: "top", value: "top", text: "Top" },
                  { key: "bottom", value: "bottom", text: "Bottom" },
                ]} />
              )}
            </div>
            <ShoeDetail shoe={activeShoe ? shoes[activeShoe] : undefined} shoeId={activeShoe}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
