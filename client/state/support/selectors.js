
export const getSupportUser = ( state ) => state.support.supportUser;
export const getSupportToken = ( state ) => state.support.supportToken;
export const isSupportUser = ( state ) => !! ( getSupportUser( state ) && getSupportToken( state ) );
