export default ( path: string ): string => ( path === '/' ? path : path.replace( /\/$/, '' )) ;
