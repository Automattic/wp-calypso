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
  "color": { color: 'rgb( 0, 170, 220 )' },
  "column": { color: 'rgb( 144, 19, 254 )' },
  "feature": { color: 'rgb( 102, 195, 126 )' },
  "layout": { color: 'rgb( 242, 134, 10 )' },
  "subject": { color: 'grey' },
  "style": { color: 'rgb( 241, 56, 59 )' },
};

export function taxonomyToColor( taxonomy ) {
  if ( taxonomyToColorMap.hasOwnProperty( taxonomy ) ) {
    return taxonomyToColorMap[ taxonomy ];
  }
  return { color: 'purple' };
}
