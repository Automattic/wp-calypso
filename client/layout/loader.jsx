/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PulsingDot from 'calypso/components/pulsing-dot';
import { isSectionLoading } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './loader.scss';

export default function LayoutLoader() {
	const isLoading = useSelector( isSectionLoading );

	return (
		<div className={ classnames( 'layout__loader', { 'is-active': isLoading } ) }>
			{ isLoading && <PulsingDot delay={ 400 } active /> }
		</div>
	);
}
