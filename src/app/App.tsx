import { RouterProvider } from 'react-router';
import { UserProvider } from './context/user-context';
import { router } from './routes';

export default function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}
