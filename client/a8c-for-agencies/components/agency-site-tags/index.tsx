import { FormTokenField } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';

interface Props {
	tags: string[];
	isLoading: boolean;
	onSetTags: ( newTags: string[] ) => void;
}

export default function AgencySiteTags( { tags: initialTags, onSetTags }: Props ) {
	const [ tags, setTags ] = useState( initialTags );

	const handleSetTags = ( tokens: any ) => {
		setTags( tokens );
		onSetTags( tokens );
	};

	return (
		<FormTokenField
			label={ translate( 'Add new tag' ) }
			value={ tags }
			onChange={ ( tokens ) => handleSetTags( tokens ) }
		/>
	);
}
