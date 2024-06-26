import { institution } from '@wordpress/icons';
import BaseCard from '../base-card';
import CountCard from '../count-card';

export default { title: 'packages/components/Highlight Card' };

export const BaseCard_ = () => (
	<>
		<BaseCard heading={ <div>With Heading and Body</div> }>
			<div>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
				voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
				cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</div>
		</BaseCard>
		<BaseCard>
			<div>
				This card only has a body. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
				eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
				nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
				irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
				Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
				anim id est laborum.
			</div>
		</BaseCard>
		<BaseCard heading={ <div>With Only a Heading</div> }></BaseCard>
	</>
);

export const CountCard_ = () => (
	<>
		<CountCard heading="String Value" icon={ institution } value="123456789" />
		<CountCard heading="Number Value" icon={ institution } value={ 123456789 } />
	</>
);
