import { Gridicon } from '@automattic/components';
import { useState } from 'react';

function Favicon( props ) {
	const { site, className, size } = props;
	const [ hasError, setError ] = useState( false );

	// if loading error or missing icon show W Gridicon
	if ( hasError || site.site_icon === null ) {
		return <Gridicon icon="globe" size={ size } className={ props.className } />;
	}

	return (
		<img
			onError={ setError }
			src={ site.site_icon }
			className={ className }
			width={ size }
			alt={ site.site_icon }
		/>
	);
}

export default Favicon;
