import { FormTokenField } from '@wordpress/components';
import { translate } from 'i18n-calypso';

interface Props {
	tags: string[];
	onChange: ( newTags: string[] ) => void;
}

export default function AgencySiteTags( { tags, onChange }: Props ) {
	const handleSetTags = ( tokens: any ) => {
		onChange( tokens );
	};

	return (
		<FormTokenField
			label={ translate( 'Add new tag' ) }
			value={ tags }
			onChange={ ( tokens ) => handleSetTags( tokens ) }
		/>
	);
}
