/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import { recordGoogleEvent } from 'state/analytics/actions';

class ProfileLinksAddWordPressSite extends Component {
	static propTypes = {
		onChange: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		checked: PropTypes.bool,
	};

	static defaultProps = {
		checked: false,
	};

	onSelect = ( event ) => {
		this.props.onSelect( event, this.getInputName() );
	};

	getCheckboxEventHandler = ( checkboxName ) => ( event ) => {
		const action = 'Clicked ' + checkboxName + ' checkbox';
		const value = event.target.checked ? 1 : 0;

		this.props.recordGoogleEvent( 'Me', action, 'checked', value );
	};

	getInputName() {
		return `site-${ this.props.site.ID }`;
	}

	render() {
		const { checked, onChange, site } = this.props;

		return (
			<li
				key={ site.ID }
				className="profile-links-add-wordpress__item"
				onClick={ this.getCheckboxEventHandler( 'Add WordPress Site' ) }
			>
				<input
					className="profile-links-add-wordpress__checkbox"
					type="checkbox"
					name={ this.getInputName() }
					onChange={ onChange }
					checked={ checked }
				/>
				<Site site={ site } indicator={ false } onSelect={ this.onSelect } />
			</li>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( ProfileLinksAddWordPressSite );
