import { comment } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import FseBetaFeedbackForm from './feedback-form';

const BetaFeedbackPlugin = () => {
	const { PluginSidebar } = window?.wp?.editSite;

	if ( ! PluginSidebar ) {
		return;
	}

	return (
		<PluginSidebar name="fse-beta-feedback-plugin" title="FSE Beta Feedback" icon={ comment }>
			<FseBetaFeedbackForm />
		</PluginSidebar>
	);
};

registerPlugin( 'fse-beta-feedback-plugin', { render: BetaFeedbackPlugin } );
