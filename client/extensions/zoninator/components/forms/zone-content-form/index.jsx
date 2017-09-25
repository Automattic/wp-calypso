/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { FieldArray, reduxForm } from 'redux-form';

/**
 * Internal dependencies
 */
import PostsList from './posts-list';
import CompactCard from 'components/card';
import FormButton from 'components/forms/form-button';
import SectionHeader from 'components/section-header';

const form = 'extensions.zoninator.zoneContent';

class ZoneContentForm extends PureComponent {
	static propTypes = {
		handleSubmit: PropTypes.func.isRequired,
		label: PropTypes.string.isRequired,
		onSubmit: PropTypes.func.isRequired,
		submitting: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
	}

	save = data => this.props.onSubmit( form, data );

	render() {
		const {
			handleSubmit,
			label,
			submitting,
			translate,
		} = this.props;

		return (
			<form onSubmit={ handleSubmit( this.save ) }>
				<SectionHeader label={ label }>
					<FormButton
						compact
						disabled={ submitting }>
						{ translate( 'Save' ) }
					</FormButton>
				</SectionHeader>
				<CompactCard>
					<FieldArray
						rerenderOnEveryChange
						name="posts"
						component={ PostsList } />
				</CompactCard>
			</form>
		);
	}
}

const createReduxForm = reduxForm( {
	enableReinitialize: true,
	form,
} );

export default flowRight(
	localize,
	createReduxForm,
)( ZoneContentForm );
