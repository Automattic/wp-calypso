import { Button, Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

const InlineHelpContactPage = ( { closeContactPage } ) => {
	const { __ } = useI18n();

	return (
		<>
			<Button borderless={ false } onClick={ closeContactPage }>
				<Gridicon icon={ 'chevron-left' } size={ 18 } />
				{ __( 'Still need help?' ) }
			</Button>
			<div>contact</div>
		</>
	);
};

export const InlineHelpContactPageButton = ( { onClick } ) => {
	const { __ } = useI18n();

	return (
		<Button borderless={ false } onClick={ onClick }>
			<Gridicon icon={ 'chevron-left' } size={ 18 } />
			{ __( 'Still need help?' ) }
		</Button>
	);
};

export default InlineHelpContactPage;
