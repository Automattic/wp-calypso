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
import SearchCard from 'components/search-card';
import HelpResults from 'me/help/help-results';

class InlineHelp extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	state = {
		showInlineHelp: false,
	};

	toggleInlineHelp = () => {
		const { showInlineHelp } = this.state;
		this.setState( {
			showInlineHelp: ! showInlineHelp,
		} );
	};

	closeInlineHelp = () => {
		this.setState( { showInlineHelp: false } );
	};

	handleHelpButtonClicked = () => {
		this.toggleInlineHelp();
	};

	onSearch = () => {
		console.log( 'Searchin.' );
	};

	render() {
		const { translate } = this.props;
		return (
			<Button
				className="sidebar__footer-help"
				onClick={ this.handleHelpButtonClicked }
				borderless
				title={ translate( 'Help' ) }
				ref={ node => ( this.inlineHelpToggle = node ) }
			>
				<Gridicon icon="help-outline" />
				<Popover
					isVisible={ this.state.showInlineHelp }
					onClose={ this.closeInlineHelp }
					position="top right"
					context={ this.inlineHelpToggle }
					className="inline-help__popover"
				>
					<div className="inline-help__heading">
						<SearchCard
							placeholder={ translate( 'How can we help?' ) }
							onSearch={ this.onSearch }
							delaySearch={ true }
						/>

						<ul className="inline-help__results-placeholder">
							<li className="inline-help__results-placeholder-item" />
							<li className="inline-help__results-placeholder-item" />
							<li className="inline-help__results-placeholder-item" />
						</ul>

						<Button borderless href="/help">
							<Gridicon icon="help" /> More help
						</Button>
					</div>
				</Popover>
			</Button>
		);
	}
}

const mapStateToProps = state => {
	return {};
};
const mapDispatchToProps = {};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelp ) );
