/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import { useTranslate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

export default function DomainManagementHeader( props ) {
	const { onClick, backHref, children } = props;
	const translate = useTranslate();

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<React.Fragment>
			<FormattedHeader
				className="stats__section-header"
				headerText={ translate( 'Domains' ) }
				align="left"
			/>
			<HeaderCake className="domain-management-header" onClick={ onClick } backHref={ backHref }>
				<div className="domain-management-header__children">
					<span className="domain-management-header__title">{ children }</span>
				</div>
				<DocumentHead title={ children } />
			</HeaderCake>
		</React.Fragment>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
