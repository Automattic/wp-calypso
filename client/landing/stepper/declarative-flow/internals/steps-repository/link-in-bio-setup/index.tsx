/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Gridicon, Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import FormattedHeader from 'calypso/components/formatted-header';
import FormInput from './form-input';
import type { Step } from '../../types';

import './styles.scss';

const LinkInBioSetup: Step = function LinkInBioSetup( { navigation } ) {
	const { goNext } = navigation;
	const siteNameErrorMsg = 'Your site needs a name so your subscribers can identify you.';
	const siteBriefDescriptionErrorMsg =
		'Your site needs a brief description so your subscribers can identify you.';
	const { __ } = useI18n();

	const onChangeSiteName = () => {
		return;
	};

	const onChangeSiteDescription = () => {
		return;
	};

	return (
		<div className="step-container">
			<form>
				<FormattedHeader align={ 'center' } headerText={ __( 'Set up Link in Bio' ) } />
				<div className="link-in-bio-setup__form">
					<div className="link-in-bio-setup-form-icon__container">
						<div className="link-in-bio-setup-form__icon">
							<Gridicon key={ 'blue' } icon="share-ios" size={ 18 } />
						</div>
						<label htmlFor="">{ __( 'Upload site icon' ) }</label>{ ' ' }
					</div>
					<FormInput
						inputValue={ '' } // get value from store?
						isValid={ true }
						onChange={ onChangeSiteName }
						errorMessage={ siteNameErrorMsg }
					/>
					<FormInput
						inputValue={ '' } // get value from store?
						isValid={ true }
						onChange={ onChangeSiteDescription }
						errorMessage={ siteBriefDescriptionErrorMsg }
					/>
					<div className="link-in-bio-setup-form__field">
						<label className="link-in-bio-setup-form__label" htmlFor="linkInBioSiteName">
							{ __( 'Publication address' ) }
						</label>
						<div className="link-in-bio-setup-form-field__container">
							<div className="link-in-bio-setup-form-container__address">
								{ 'www.test.link ' }
								<button className="link-in-bio-setup-form__button">{ __( 'Change' ) }</button>
							</div>
						</div>
					</div>
				</div>
				<Button className="link-in-bio-setup-form__submit" primary onClick={ goNext }>
					{ __( 'Continue' ) }
				</Button>
			</form>
		</div>
	);
};

export default LinkInBioSetup;
