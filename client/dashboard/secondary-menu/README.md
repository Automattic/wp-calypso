# Secondary Menu

A component for the dashboard header that provides access to Reader, Notifications, Help, and User Profile.

## Design Decisions

### Component Architecture
- Built using exclusively `@wordpress/components` to maintain design system consistency
- Avoids Redux and Calypso state dependencies to keep the component portable
- Uses React Router for navigation
- TypeScript interfaces for props to ensure type safety

### User Experience
- Icons use the WordPress icon system when available
- Custom icons follow the WordPress icon design principles
- Notification indicators are small red dots that appear on the icons
- The profile dropdown provides user information and a logout option

### Accessibility
- All icons have proper labels using `aria-label`
- Dropdown menus use proper ARIA attributes
- Focus management follows accessibility best practices

## Future Improvements

1. **Authentication Integration**: Currently, the profile section uses placeholder data. It should be integrated with the actual authentication system.

2. **Notification Count**: Implement a real-time notification count system using React Query instead of Redux.

3. **Help Center Integration**: Connect the help icon to the actual help center system.

4. **Performance Optimization**: Add memoization to prevent unnecessary re-renders.

5. **User Profile Data**: Connect to a user data API to show real user information.

## Usage

```jsx
import SecondaryMenu from 'client/dashboard/secondary-menu';

function Header() {
  return (
    <div className="dashboard-header">
      <Logo />
      <MainMenu />
      <SecondaryMenu />
    </div>
  );
}
```