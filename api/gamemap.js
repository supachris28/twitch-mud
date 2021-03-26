const getSurrounding = (layout, x, y) => {
  const position = {};
  const yMax = layout.length - 1;
  const xMax = layout[0].length - 1;

  if (y > 0)
    position.n = layout[y-1][x];
  
  if (y < yMax)
    position.s = layout[y+1][x];

  if (x > 0)
    position.w = layout[y][x-1];
  
  if (x < xMax)
    position.e = layout[y][x+1];

  if (x < xMax && y > 0)
    position.ne = layout[y-1][x+1];
  
  if (x > 0 && y > 0)
    position.nw = layout[y-1][x-1];

  if (x <= xMax && y < yMax)
    position.se = layout[y+1][x+1];
  
  if (x > 0 && y < yMax)
    position.sw = layout[y+1][x-1];

  return position;
}

const generateLayout = async (size) => {
  const layout = []
  //  Build the rows
  for(let y = 0; y < size; y = y + 1) {
    layout[y] = [];
    // Build the columns
    for(let x = 0; x < size; x = x + 1) {
      layout [y][x] = {};
      let wall = false;
      let destructable = false;
      // Add the walls
      if ((y == 0 || y == (size - 1)) 
        || (x == 0 || x == (size - 1))) {
        wall = true;
      } else {
        // Generate random wall
        let random = 0.2;
        const position = getSurrounding(layout, x, y);
        if(position.n.wall || position.w.wall) {
          random = 0.5

          // 0 wall if will make a square
          if (position.n.wall && position.w.wall && position.nw.wall) {
            random = 0;
          }
        }
        if(Math.random() < random) {
          wall = true;
          // Can you blow the wall up!
          if(Math.random() < 0.5) {
            destructable = true;
          }
        }
      }
      layout[y][x] = {
        wall,
        destructable,
      }
    }
  }
  return layout
}

const fillSingleBlank = (layout) => {
  return layout.map((row, y) => {
    return row.map((column, x) => {
      const surrounding = getSurrounding(layout, x, y);
      if (!column.wall
        && surrounding.n.wall 
        && surrounding.e.wall
        && surrounding.s.wall
        && surrounding.w.wall) {
          column.wall = true;
        }
      return column;
    });
  });
}

const selectExit = (layout) => {
  const x = (Math.floor(Math.random() * layout.length - 1));
  const y = (Math.floor(Math.random() * layout.length - 1));
  const surrounding = getSurrounding(layout, x, y);
  return {
    x,
    y,
  }
}

module.exports = (app, pathName, opts) => async (
  data,
  h
) => {
    // Size of the game area
    const gameSize = 20;
    // Creates the initial layout
    let layout = await generateLayout(gameSize);
    // Fill in tiny spaces
    layout = await fillSingleBlank(layout);
    // Add an exit
    const exit = selectExit(layout);
    return h.response({
      layout,
      'monsters': [],
      exit
    })
  }
