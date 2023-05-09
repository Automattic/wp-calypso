import AsyncLoad from 'calypso/components/async-load';

const WebPreview = ( props ) => {
	if ( ! props.showPreview ) {
		return null;
	}

	return (
		<AsyncLoad
			{ ...props }
			require="calypso/components/web-preview/component"
			placeholder={ null }
		/>
	);
};

export default WebPreview;
