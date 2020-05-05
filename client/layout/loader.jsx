/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import PulsingDot from 'components/pulsing-dot';
import { isSectionLoading } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './loader.scss';

const LayoutLoader = ( { isLoading } ) => (
	<div className={ classnames( 'layout__loader', { 'is-active': isLoading } ) }>
		{ isLoading && <PulsingDot delay={ 400 } active /> }
	</div>
);

export default connect( ( state ) => ( {
	isLoading: isSectionLoading( state ),
} ) )( LayoutLoader );
