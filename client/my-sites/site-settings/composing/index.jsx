import { CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import DateTimeFormat from '../date-time-format';
import DefaultPostCategory from './default-post-category';
import DefaultPostFormat from './default-post-format';
import Latex from './latex';
import Markdown from './markdown';
import Shortcodes from './shortcodes';

const Composing = ( {
	translate,
	isAtomic,
	siteIsJetpack,
	eventTracker,
	fields,
	handleSelect,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	updateFields,
	handleSubmitForm,
} ) => (
	<>
		<SettingsSectionHeader
			disabled={ isRequestingSettings || isSavingSettings }
			isSaving={ isSavingSettings }
			onButtonClick={ handleSubmitForm }
			showButton
			title={ translate( 'Composing' ) }
		/>
		<CompactCard className="composing__card site-settings">
			<DefaultPostCategory
				eventTracker={ eventTracker }
				fields={ fields }
				isRequestingSettings={ isRequestingSettings }
				isSavingSettings={ isSavingSettings }
				onChangeField={ onChangeField }
			/>
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
			isAtomic={ isAtomic }
			siteIsJetpack={ siteIsJetpack }
			handleToggle={ handleToggle }
		/>

		{ siteIsJetpack && (
			<>
				<Latex
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					isAtomic={ isAtomic }
				/>
				<Shortcodes
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					isAtomic={ isAtomic }
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
	isAtomic: PropTypes.bool,
	siteIsJetpack: PropTypes.bool,
	eventTracker: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	handleSubmitForm: PropTypes.func.isRequired,
	fields: PropTypes.object,
	handleSelect: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	isRequestingSettings: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
	onChangeField: PropTypes.func.isRequired,
	updateFields: PropTypes.func.isRequired,
};

export default Composing;
