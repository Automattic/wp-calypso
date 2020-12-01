/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FormButton from 'calypso/components/forms/form-button';
import SectionHeader from 'calypso/components/section-header';
import PostsList from './posts-list';

class ZoneContentForm extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		label: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		requesting: PropTypes.bool,
		submitting: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		posts: [],
	};

	componentDidUpdate( prevProps ) {
		if (
			! this.props.requesting &&
			prevProps.requesting &&
			this.props.initialValues &&
			! this.state.posts.length
		) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( {
				posts: this.props.initialValues,
			} );
		}
	}

	updatePosts = ( posts ) => {
		this.setState( {
			posts,
		} );
	};

	save = ( event ) => {
		event.preventDefault();

		this.props.onSubmit( this.state.posts );
	};

	render() {
		const { disabled, label, requesting, submitting, translate } = this.props;
		const isDisabled = disabled || requesting || submitting;

		return (
			<form onSubmit={ this.save }>
				<SectionHeader label={ label }>
					<FormButton compact disabled={ isDisabled }>
						{ translate( 'Save' ) }
					</FormButton>
				</SectionHeader>
				<CompactCard>
					<PostsList
						posts={ this.state.posts }
						updatePosts={ this.updatePosts }
						requesting={ isDisabled }
					/>
				</CompactCard>
			</form>
		);
	}
}

export default localize( ZoneContentForm );
