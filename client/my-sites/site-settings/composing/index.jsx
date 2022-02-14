import { CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import DateTimeFormat from '../date-time-format';
import DefaultPostFormat from './default-post-format';
import Latex from './latex';
import Markdown from './markdown';
import PublishConfirmation from './publish-confirmation';
import Shortcodes from './shortcodes';

const Composing = ( {
	siteIsAutomatedTransfer,
	siteIsJetpack,
	eventTracker,
	fields,
	handleSelect,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	setFieldValue,
	updateFields,
} ) => (
	<>
		<CompactCard className="composing__card site-settings">
			<PublishConfirmation />
			<DefaultPostFormat
				eventTracker={ eventTracker }
				fields={ fields }
				isRequestingSettings={ isRequestingSettings }
				isSavingSettings={ isSavingSettings }
				onChangeField={ onChangeField }
			/>
		</CompactCard>

		<Markdown
			fields={ fields }
			isRequestingSettings={ isRequestingSettings }
			isSavingSettings={ isSavingSettings }
			siteIsAutomatedTransfer={ siteIsAutomatedTransfer }
			siteIsJetpack={ siteIsJetpack }
			handleToggle={ handleToggle }
		/>

		{ siteIsJetpack && (
			<>
				<Latex
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					siteIsAutomatedTransfer={ siteIsAutomatedTransfer }
					setFieldValue={ setFieldValue }
				/>
				<Shortcodes
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					siteIsAutomatedTransfer={ siteIsAutomatedTransfer }
					setFieldValue={ setFieldValue }
				/>
			</>
		) }

		<DateTimeFormat
			fields={ fields }
			handleSelect={ handleSelect }
			isRequestingSettings={ isRequestingSettings }
			isSavingSettings={ isSavingSettings }
			updateFields={ updateFields }
		/>
	</>
);

Composing.defaultProps = {
	fields: {},
	isRequestingSettings: true,
	isSavingSettings: false,
};

Composing.propTypes = {
	siteIsAutomatedTransfer: PropTypes.bool,
	siteIsJetpack: PropTypes.bool,
	eventTracker: PropTypes.func.isRequired,
	fields: PropTypes.object,
	handleSelect: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	isRequestingSettings: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
	onChangeField: PropTypes.func.isRequired,
	setFieldValue: PropTypes.func.isRequired,
	updateFields: PropTypes.func.isRequired,
};

export default Composing;
