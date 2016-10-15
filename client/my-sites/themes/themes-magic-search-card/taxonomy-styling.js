/**
  * This is a helper file that establishes designed visual connection between
  * search taxonomy and its graphical representation.
  */

const taxonomyToGridiconMap = {
  "color": "ink",
  "column": "align-justify",
  "feature": "customize",
  "layout": "layout",
  "subject": "info-outline",
  "style": "themes",
};

export function taxonomyToGridicon( taxonomy ) {
  if ( taxonomyToGridiconMap.hasOwnProperty( taxonomy ) ) {
    return taxonomyToGridiconMap[ taxonomy ];
  }
  return "tag";
}

const taxonomyToColorMap = {
  "color": { color: 'rgb( 56, 46, 36 )' },
  "column": { color: 'green' },
  "feature": { color: 'blue' },
  "layout": { color: 'yellow' },
  "subject": { color: 'grey' },
  "style": { color: 'red' },
};

export function taxonomyToColor( taxonomy ) {
  if ( taxonomyToColorMap.hasOwnProperty( taxonomy ) ) {
    return taxonomyToColorMap[ taxonomy ];
  }
  return { color: 'purple' };
}
