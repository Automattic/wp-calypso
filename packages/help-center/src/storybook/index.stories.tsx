import { useState } from 'react';
import HelpCenter from '..';

export default { title: 'help-center' };

const Playground = () => {
	return <div className={ 'storybook__helpcenter-playground' }></div>;
};

const HelpCenterStory = () => {
	const [ showHelpCenter, setShowHelpCenter ] = useState( false );

	return (
		<div className="storybook__helpcenter">
			<Playground />
			<button onClick={ () => setShowHelpCenter( showHelpCenter ? false : true ) }>
				Help Center
			</button>
			{ showHelpCenter && <HelpCenter /> }
		</div>
	);
};

export const Default = (): JSX.Element => <HelpCenterStory />;
