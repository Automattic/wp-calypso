/**
 * External dependencies
 */
import React, { useContext, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { __, setLocaleData, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import LocalizeContext from './localize-context';

function useLocalizeFactory( locale ) {
	const localize = useRef( ( text ) => text );
	useEffect( () => {
		setLocaleData( getLocaleDataForLocale( locale ) );
		localize.current = ( text ) => __( text, 'default' );
	}, [ locale ] );
	return localize.current;
}

export function useLocalize() {
	const localize = useContext( LocalizeContext );
	if ( typeof localize !== 'function' ) {
		throw new Error( 'useLocalize can only be used inside a CheckoutProvider' );
	}
	return localize;
}

export function LocalizeProvider( { locale, children } ) {
	if ( ! locale ) {
		throw new Error( 'LocalizeProvider requires locale' );
	}
	const localize = useLocalizeFactory( locale );
	return <LocalizeContext.Provider value={ localize }>{ children }</LocalizeContext.Provider>;
}

LocalizeProvider.propTypes = {
	locale: PropTypes.string.isRequired,
};

// TODO: how do we get this data for the locale?
function getLocaleDataForLocale( locale ) {
	switch ( locale ) {
		case 'fr':
			return {
				'': {
					domain: 'default',
					lang: 'fr',
					plural_forms: 'nplurals=2; plural=(n != 1);',
				},
				'First name': [ 'Prénom' ],
				'Last name': [ 'Nom' ],
				'Email address': [ 'Adresse e-mail' ],
				Address: [ 'Adresse' ],
				City: [ 'Ville' ],
				Province: [ 'Province' ],
				'Postal code': [ 'Code postal' ],
				Country: [ 'Pays' ],
				'Phone number (Optional)': [ 'Numéro de téléphone (Optionnel)' ],
				'Use your billing details for your domain registration contact information.': [
					'Utilisez vos informations de facturation pour les informations de contact de votre domaine.',
				],
				'Enter your billing details': [ 'Entrez vos détails de facturation' ],
				Continue: [ 'Continuez' ],
				'Review your order': [ 'Vérifiez votre commande' ],
				'You are all set to check out': [ 'Vous êtes prêt à partir' ],
				'Pick a payment method': [ 'Choisissez un mode de paiement' ],
				'Order Summary': [ 'Apitulatif de la commande' ],
				'Add a coupon': [ 'Ajouter un coupon' ],
				'Credit or debit card': [ 'Carte de crédit ou de débit' ],
				'Card number': [ 'Numéro de carte' ],
				'Expiry date': [ "Date d'expiration" ],
				'Security code': [ 'Code de sécurité' ],
				'Expiry Date': [ "Date d'expiration" ],
				'Security Code': [ 'Code de sécurité' ],
				'Cardholder name': [ 'Nom du titulaire' ],
				"Enter your name as it's written on the card": [
					"Entrez votre nom tel qu'il est écrit sur la carte",
				],
				'Pay %s': [ 'Payez %s' ],
			};
		default:
			return {
				'': {
					domain: 'default',
					lang: 'en',
					plural_forms: 'nplurals=2; plural=(n != 1);',
				},
			};
	}
}

export { sprintf };
