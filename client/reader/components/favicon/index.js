/**
 * External dependencies
 */
import React, { useState } from 'react';
import Gridicon from 'components/gridicon';

function Favicon( props ) {
	const { site, className, size } = props;
	const [ hasError, setError ] = useState( false );

	// if loading error show W Gridicon
	if ( hasError ) {
		return <Gridicon icon="my-sites" size={ 18 } className={ props.className } />;
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
