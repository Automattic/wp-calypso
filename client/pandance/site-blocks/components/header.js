/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

export const Header = props => <div className="site-header section">

	<h1 className="site-title">{ props.name }</h1>

</div>;

export default connect( ( state, props ) => ( {
	name: state.pandance.business.name || 'Your Business Name',
} ) )( Header );
