import page from '@automattic/calypso-router';
import {
	Button,
	CheckboxControl,
	Flex,
	FlexItem,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { leaveSite } from 'calypso/state/sites/actions';
import './leave-site-modal-form.scss';

export interface LeaveSiteModalFormProps {
	siteId: number;
	onClose: () => void;
}

const LeaveSiteModalForm = ( { siteId, onClose }: LeaveSiteModalFormProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isChecked, setChecked ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const handleLeaveSite = async () => {
		if ( ! isChecked ) {
			return;
		}

		try {
			setIsSubmitting( true );
			const result = await dispatch( leaveSite( siteId ) );
			if ( result ) {
				page.redirect( '/sites' );
			}
		} finally {
			setIsSubmitting( false );
		}
	};

	return (
		<form
			className="leave-site-modal__form"
			onSubmit={ ( event ) => {
				event.preventDefault();
				handleLeaveSite();
			} }
		>
			<VStack spacing={ 6 }>
				<VStack spacing={ 0 }>
					<p>
						{ translate(
							'Leaving will remove your access to the site, including all content, users, domains, upgrades, and anything else you have access to.'
						) }
					</p>
					<p>
						{ translate(
							'To regain access, a current administrator must re-invite you. Please confirm this is your intent before proceeding.'
						) }
					</p>
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ translate( 'I understand the consequences of leaving' ) }
						checked={ isChecked }
						disabled={ isSubmitting }
						onChange={ setChecked }
					/>
				</VStack>
				<Flex justify="flex-end" expanded={ false }>
					<FlexItem>
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							disabled={ isSubmitting }
							onClick={ onClose }
						>
							{ translate( 'Cancel' ) }
						</Button>
					</FlexItem>
					<FlexItem>
						<Button
							__next40pxDefaultSize
							variant="primary"
							disabled={ ! isChecked }
							isBusy={ isSubmitting }
							onClick={ handleLeaveSite }
						>
							{ translate( 'Leave site' ) }
						</Button>
					</FlexItem>
				</Flex>
			</VStack>
		</form>
	);
};

export default LeaveSiteModalForm;
