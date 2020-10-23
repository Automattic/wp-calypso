# G Suite

G Suite is a helper library to help interact with G Suite components and APIs

## New Users

### Usage

The `GSuiteNewUserList` depends on its parent managing the state of the new users. For this purpose `lib/gsuite/new-users` provides a collection of helper functions

```jsx
import { newUsers } from 'calypso/lib/gsuite/new-users';

const GSuiteExample = () => {
	const [ users, setUsers ] = useState( newUsers( 'test.com' ) );

	return (
		<Card>
			<GSuiteNewUserList
				domains={ domains }
				extraValidation={ ( user ) => user }
				selectedDomainName={ 'test.com' }
				onUsersChange={ ( changedUsers ) => setUsers( changedUsers ) }
				users={ users }
			>
				<span>
					{ areAllUsersValid( users ) ? '✅ - All Users Ready' : '❌- Verification Errors' }
				</span>
			</GSuiteNewUserList>
		</Card>
	);
};
```
