import { useState } from 'react';
import HelpCenter from '..';

export default {
	title: 'help-center',
};

const Playground = () => {
	return <div className={ 'storybook__helpcenter-playground' }></div>;
};

const HelpCenterContent = () => (
	<div style={ { backgroundColor: '#rrr' } }>
		<h1>Welcome</h1>
		<p>This is the help center</p>
	</div>
);

const HelpCenterStory = () => {
	const [ showHelpCenter, setShowHelpCenter ] = useState( false );

	return (
		<div className="storybook__helpcenter">
			<Playground />
			<button onClick={ () => setShowHelpCenter( showHelpCenter ? false : true ) }>
				Help Center
			</button>
			{ showHelpCenter && (
				<HelpCenter
					handleClose={ () => setShowHelpCenter( false ) }
					content={ <HelpCenterContent /> }
				/>
			) }
		</div>
	);
};

export const Default = (): JSX.Element => <HelpCenterStory />;
