/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FieldArray, reduxForm } from 'redux-form';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import SectionHeader from 'components/section-header';
import PostsList from './posts-list';

const form = 'extensions.zoninator.zoneContent';

class ZoneContentForm extends PureComponent {
	static propTypes = {
		disabled: PropTypes.bool,
		handleSubmit: PropTypes.func.isRequired,
		label: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		requesting: PropTypes.bool,
		submitting: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
	};

	save = ( data ) => this.props.onSubmit( form, data );

	render() {
		const { disabled, handleSubmit, label, requesting, submitting, translate } = this.props;
		const isDisabled = disabled || requesting || submitting;

		return (
			<form onSubmit={ handleSubmit( this.save ) }>
				<SectionHeader label={ label }>
					<FormButton compact disabled={ isDisabled }>
						{ translate( 'Save' ) }
					</FormButton>
				</SectionHeader>
				<CompactCard>
					<FieldArray
						rerenderOnEveryChange
						name="posts"
						props={ { requesting } }
						component={ PostsList }
					/>
				</CompactCard>
			</form>
		);
	}
}

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form,
} );

export default flowRight( localize, createReduxForm )( ZoneContentForm );
