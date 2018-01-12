/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, noop, omitBy, isUndefined } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import Popover from 'components/popover';

class InlineHelp extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	handleOpenHelp = event => {
		event.preventDefault();
		console.log( '// TODO: open a Popover ...' );
		return false;
	};

	render() {
		const { translate } = this.props;
		return (
			<Button
				className="sidebar__footer-help"
				onClick={ this.handleOpenHelp }
				borderless
				href="/help"
				title={ translate( 'Help' ) }
			>
				<Gridicon icon="help-outline" />
			</Button>
		);
	}
}

const mapStateToProps = state => {
	return {};
};
const mapDispatchToProps = {};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelp ) );
