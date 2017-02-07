/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DefaultPostFormat from './default-post-format';
import MarkdownWpcom from './markdown-wpcom';

const Composing = ( {
	fields,
	handleToggle,
	onChangeField,
	eventTracker,
	isRequestingSettings,
	isSavingSettings
} ) => {
	return (
		<Card className="site-settings">
			<DefaultPostFormat
				onChangeField={ onChangeField }
				eventTracker={ eventTracker }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>

			{
				fields.markdown_supported &&
				<MarkdownWpcom
					handleToggle={ handleToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			}
		</Card>
	);
};

Composing.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

Composing.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	onChangeField: PropTypes.func.isRequired,
	eventTracker: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default Composing;
