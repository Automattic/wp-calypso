import { useState, ReactElement } from 'react';
import HelpCenter from '..';

export default {
	title: 'help-center',
};

const Playground = () => {
	return <div className={ 'storybook__helpcenter-playground' }></div>;
};

const HelpCenterLongContent = () => {
	return (
		<div>
			<h1>HTML Ipsum Presents</h1>

			<p>
				<strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames
				ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet,
				ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em>{ ' ' }
				Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
				Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi.
				Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
				lacus enim ac dui. in turpis pulvinar facilisis. Ut felis.
			</p>

			<h2>Header Level 2</h2>

			<p>
				<strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames
				ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet,
				ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em>{ ' ' }
				Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
				Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi.
				Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
				lacus enim ac dui. in turpis pulvinar facilisis. Ut felis.
			</p>

			<p>
				<strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames
				ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet,
				ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em>{ ' ' }
				Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
				Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi.
				Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
				lacus enim ac dui. in turpis pulvinar facilisis. Ut felis.
			</p>

			<ol>
				<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
				<li>Aliquam tincidunt mauris eu risus.</li>
			</ol>

			<blockquote>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at
					felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec
					eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit
					sit amet quam. Vivamus pretium ornare est.
				</p>
			</blockquote>

			<h3>Header Level 3</h3>

			<ul>
				<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
				<li>Aliquam tincidunt mauris eu risus.</li>
			</ul>
		</div>
	);
};

const HelpCenterShortContent = () => {
	return (
		<div>
			<p>
				<strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames
				ac turpis egestas.
			</p>
		</div>
	);
};

const HelpCenterStory: React.FC< { content: ReactElement } > = ( { content } ) => {
	const [ showHelpCenter, setShowHelpCenter ] = useState( false );

	return (
		<div className="storybook__helpcenter">
			<Playground />
			<button onClick={ () => setShowHelpCenter( showHelpCenter ? false : true ) }>
				Help Center
			</button>
			{ showHelpCenter && (
				<HelpCenter handleClose={ () => setShowHelpCenter( false ) } content={ content } />
			) }
		</div>
	);
};

export const Default = (): JSX.Element => <HelpCenterStory content={ <HelpCenterLongContent /> } />;
export const ShortContent = (): JSX.Element => (
	<HelpCenterStory content={ <HelpCenterShortContent /> } />
);
