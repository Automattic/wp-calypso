const mockProductValues = () => ( {
	isBusiness: ( arg ) => arg.isBusiness(),
	isPersonal: ( arg ) => arg.isPersonal(),
	isPremium: ( arg ) => arg.isPremium(),
} );

export default mockProductValues;
