
import PropTypes from 'prop-types';
import { Route, Navigate } from 'react-router-dom';

function isAuthenticated() {
  // ตรวจสอบการล็อกอิน เช่น ตรวจสอบว่ามี token ใน localStorage
  return !!localStorage.getItem('token');
}

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      element={isAuthenticated() ? <Component /> : <Navigate to="/login" replace />}
    />
  );
}

// การตรวจสอบประเภทของ props
PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
};

export default PrivateRoute;
