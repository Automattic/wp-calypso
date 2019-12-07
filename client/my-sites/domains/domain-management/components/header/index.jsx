/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import DocumentHead from 'components/data/document-head';

/**
 * Style dependencies
 */
import './style.scss';

export default function DomainManagementHeader( props ) {
	const { onClick, backHref, selectedDomainName, children } = props;

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<HeaderCake className="domain-management-header" onClick={ onClick } backHref={ backHref }>
			<div className="domain-management-header__children">
				{ selectedDomainName && <span>{ selectedDomainName }: </span> }
				<span className="domain-management-header__title">{ children }</span>
			</div>
			<DocumentHead title={ children } />
		</HeaderCake>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
