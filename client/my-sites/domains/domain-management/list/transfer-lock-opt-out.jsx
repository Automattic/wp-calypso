import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import { UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES } from 'calypso/lib/url/support';
import DesignatedAgentNotice from 'calypso/my-sites/domains/domain-management/components/designated-agent-notice';

export default function TransferLockOptOut( { disabled, saveButtonLabel, onChange } ) {
	const translate = useTranslate();

	return (
		<div>
			<FormLabel>
				<FormCheckbox name="transfer-lock-opt-out" disabled={ disabled } onChange={ onChange } />
				<span>
					{ translate( 'Opt-out of the {{link}}60-day transfer lock{{/link}}.', {
						components: {
							link: (
								<a
									href={ UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					} ) }
				</span>
			</FormLabel>
			<DesignatedAgentNotice saveButtonLabel={ saveButtonLabel } />
		</div>
	);
}

TransferLockOptOut.propTypes = {
	disabled: PropTypes.bool,
	saveButtonLabel: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

TransferLockOptOut.defaultProps = { disabled: false, saveButtonLabel: 'Save contact info' };
