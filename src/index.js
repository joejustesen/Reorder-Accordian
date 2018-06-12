import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import * as R from "ramda";
import short from "short-uuid";
import styled, { css } from "react-emotion";

import FaAngleDown from "react-icons/lib/fa/angle-down";
import FaAngleUp from "react-icons/lib/fa/angle-up";

const translator = short();

function genId() {
  return translator.new();
}

// fake data generator
const getItems = count =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: genId(),
    content: `item ${k}`
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 6;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  ...draggableStyle
});

function getItemStyle2(isDragging) {
  return {
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey"
  };
}

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 600
});

const TitleBarStyle = styled("div")`
  label: poc-title-bar;
  width: 100%;
  text-align: center;
  background-color: #066289;
  color: #ffffff;
  border-bottom: 1px solid #aaaaaa;
`;

function Title(props) {
  return (
    <TitleBarStyle {...props}>
      {props.name}
      {props.expanded ? (
        <FaAngleUp
          onClick={props.onExpand}
          className={css`
            float: right;
            &:hover {
              cursor: pointer;
            }
          `}
        />
      ) : (
        <FaAngleDown
          onClick={props.onExpand}
          className={css`
            float: right;
            &:hover {
              cursor: pointer;
            }
          `}
        />
      )}
    </TitleBarStyle>
  );
}

class Item extends React.Component {
  calcStyle = (isDragging, draggableStyle) => {
    return css(getItemStyle2(isDragging), draggableStyle);
  };

  state = { expanded: true };

  handleExpanded = ev => {
    ev.preventDefault();

    this.setState(({ expanded }) => {
      return { expanded: !expanded, inTransition: true };
    });
  };

  handleTransitionEnd = () => {
    this.setState({ inTransition: false });
  };

  render() {
    const { id, index, children } = this.props;
    const { expanded, inTransition } = this.state;
    const ttf = expanded ? 'ease-in' : 'ease-out';
    const transition = inTransition ? `height 250ms ${ttf}` : 'none';
    const bodyStyle = css`
      display: flex;
      height: ${expanded ? 200 : 0}px;
      width: 100%;
      justify-content: center;
      align-items: center;
      transition: ${transition};
      overflow: hidden;
    `;

    return (
      <Draggable key={id} draggableId={id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={this.calcStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            <Title
              {...provided.dragHandleProps}
              onClick={this.handleExpanded}
              expanded={this.state.expanded}
              name={children}
            />
            <div className={bodyStyle} onTransitionEnd={this.handleTransitionEnd}>{id}</div>
          </div>
        )}
      </Draggable>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: getItems(10)
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items
    });
  }

  draggableFn = (item, provided, snapshot) => {
    console.log("draggableFn - draggableProps", provided.draggableProps);

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
      >
        {item.content}
      </div>
    );
  };

  droppableFn = (provided, snapshot) => {
    return (
      <div
        ref={provided.innerRef}
        style={getListStyle(snapshot.isDraggingOver)}
      >
        {this.state.items.map(({ content, id }, index) => (
          <Item id={id} index={index} key={id}>
            {content}
          </Item>
        ))}
        {provided.placeholder}
      </div>
    );
  };

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">{this.droppableFn}</Droppable>
      </DragDropContext>
    );
  }
}

// Put the thing into the DOM!
ReactDOM.render(<App />, document.getElementById("root"));
