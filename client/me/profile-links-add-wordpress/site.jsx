/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import { recordCheckboxEvent } from 'me/event-recorder';

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

	getInputName() {
		return `site-${ this.props.site.ID }`;
	}

	render() {
		const { checked, onChange, site } = this.props;

		return (
			<li
				key={ site.ID }
				className="profile-links-add-wordpress__item"
				onClick={ recordCheckboxEvent( 'Add WordPress Site' ) }
			>
				<input
					className="profile-links-add-wordpress__checkbox"
					type="checkbox"
					name={ this.getInputName() }
					onChange={ onChange }
					checked={ checked } />
				<Site
					site={ site }
					indicator={ false }
					onSelect={ this.onSelect } />
			</li>
		);
	}
}

export default ProfileLinksAddWordPressSite;
