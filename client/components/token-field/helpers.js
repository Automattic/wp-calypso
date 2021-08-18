const isSuggestionLabel = function ( suggestion ) {
	return typeof suggestion === 'object' && suggestion?.label;
};

export default isSuggestionLabel;
