/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormFieldSet from 'components/forms/form-fieldset';
import { successNotice, errorNotice, infoNotice, warningNotice, updateNotice } from 'state/notices/actions';

const GlobalNotices = React.createClass( {
	displayName: 'GlobalNotices',

	getInitialState() {
		return {
			showDismiss: true,
			button: null,
			duration: null,
			status: 'success',
		};
	},

	onChangeStatus( event ) {
		this.setState( { status: event.target.value } );
	},

	onChangeActionOption( event ) {
		this.setState( { button: event.target.checked ? 'Action' : null } );
	},

	onChangeDismissOption( event ) {
		this.setState( { showDismiss: !event.target.checked } );
	},

	onChangeDurationOption( event ) {
		this.setState( { duration: event.target.checked ? 5000 : null } );
	},

	createNotice() {
		let fn = this.props[ this.state.status + 'Notice' ];

		if ( !fn ) {
			fn = this.props.successNotice;
		}

		fn( 'This is a global ' + this.state.status + ' notice', this.state );
	},

	render() {
		return (
			<div className="design-assets__group">
				<h2>Global Notices</h2>

				<FormFieldSet>
					<FormLabel>
						<span>Status</span>
						<FormSelect
							id="global_notices_status"
							name="global_notices_status"
							onChange={ this.onChangeStatus }>
							<option value="success">Success</option>
							<option value="error">Error</option>
							<option value="info">Info</option>
							<option value="warning">Warning</option>
							<option value="update">Update</option>
						</FormSelect>
					</FormLabel>
				</FormFieldSet>

				<FormFieldSet>
					<FormLabel>Options</FormLabel>
					<FormLabel>
						<FormCheckbox
							id="global_notices_action_button"
							name="global_notices_action_button"
							onChange={ this.onChangeActionOption }
						/>
						<span>Show action button</span>
					</FormLabel>
					<FormLabel>
						<FormCheckbox
							id="global_notices_dismiss_button"
							name="global_notices_dismiss_button"
							onChange={ this.onChangeDismissOption }
						/>
						<span>Hide dismiss button</span>
					</FormLabel>
					<FormLabel>
						<FormCheckbox
							id="global_notices_duration"
							name="global_notices_duration"
							onChange={ this.onChangeDurationOption }
						/>
						<span>Close after 5 seconds ( duration: 5000 )</span>
					</FormLabel>
				</FormFieldSet>

				<Button onClick={ this.createNotice }>Create a notice</Button>
			</div>
		);
	}
} );

export default connect(
	null,
	{ successNotice, errorNotice, infoNotice, warningNotice, updateNotice }
)( GlobalNotices );
