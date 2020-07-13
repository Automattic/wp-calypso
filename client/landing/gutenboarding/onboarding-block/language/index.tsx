/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import ActionButtons, { BackButton } from '../../components/action-buttons';
import { Title } from '../../components/titles';
import { ChangeLocaleContextConsumer } from '../../components/locale-context';

/**
 * Style dependencies
 */
const LanguageStep: React.FunctionComponent = () => {
	const { i18nLocale, __ } = useI18n();
	const [ selectedLocale, setSelectedLocale ] = React.useState< string >( i18nLocale );
	const history = useHistory();

	const clickThing = () => {
		if ( selectedLocale === 'en' ) {
			setSelectedLocale( 'ar' );
		} else {
			setSelectedLocale( 'en' );
		}
	};

	const goBack = () => {
		history.goBack();
	};

	const handleConfirm = ( changeLocaleFn: ( locale: string ) => void ) => {
		changeLocaleFn( selectedLocale );
		goBack();
	};

	return (
		<ChangeLocaleContextConsumer>
			{ ( changeLocale ) => (
				<div className="gutenboarding-page language">
					<div>
						<Title>{ __( 'Select your site language' ) }</Title>
					</div>
					<Button onClick={ clickThing }>{ selectedLocale }</Button>
					<ActionButtons>
						<BackButton onClick={ goBack } />
						<Button
							isPrimary
							disabled={ ! selectedLocale }
							onClick={ () => {
								handleConfirm( changeLocale );
							} }
						>
							{ __( 'Confirm' ) }
						</Button>
					</ActionButtons>
				</div>
			) }
		</ChangeLocaleContextConsumer>
	);
};

export default LanguageStep;
