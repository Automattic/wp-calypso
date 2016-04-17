/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import { successNotice, errorNotice, infoNotice, warningNotice } from 'state/notices/actions';

const GlobalNotices = React.createClass( {
	displayName: 'GlobalNotices',

	getInitialState() {
		return {
			showDismiss: true,
			button: null,
			duration: null,
		};
	},

	showSuccessNotice() {
		this.props.successNotice( 'This is a global success notice', this.state );
	},

	showErrorNotice() {
		this.props.errorNotice( 'This is a global error notice', this.state );
	},

	showInfoNotice() {
		this.props.infoNotice( 'This is a global info notice', this.state );
	},

	showWarningNotice() {
		this.props.warningNotice( 'This is a global warning notice', this.state );
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

	render() {
		return (
			<div className="design-assets__group">
				<h2>Global Notices</h2>
				<ButtonGroup>
					<Button onClick={ this.showSuccessNotice }>Show success notice</Button>
					<Button onClick={ this.showErrorNotice }>Show error notice</Button>
					<Button onClick={ this.showInfoNotice }>Show info notice</Button>
					<Button onClick={ this.showWarningNotice }>Show warning notice</Button>
				</ButtonGroup>

				<h4>Options</h4>
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
			</div>
		);
	}
} );

export default connect(
	null,
	{ successNotice, errorNotice, infoNotice, warningNotice }
)( GlobalNotices );
