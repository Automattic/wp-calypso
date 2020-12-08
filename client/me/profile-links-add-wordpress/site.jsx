/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import Site from 'calypso/blocks/site';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

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

		/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */
		return (
			<li
				key={ site.ID }
				className="profile-links-add-wordpress__item"
				onClick={ this.getCheckboxEventHandler( 'Add WordPress Site' ) }
			>
				<FormInputCheckbox
					className="profile-links-add-wordpress__checkbox"
					name={ this.getInputName() }
					onChange={ onChange }
					checked={ checked }
				/>
				<Site site={ site } indicator={ false } onSelect={ this.onSelect } />
			</li>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( ProfileLinksAddWordPressSite );
