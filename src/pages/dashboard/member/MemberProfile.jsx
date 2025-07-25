import React from 'react';
import { useAuth } from '../../../context/Provider/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import axiosInstance from '../../../api/axiosInstance';
import Loading from '../../../components/Loading';

const MemberProfile = () => {
  const { user } = useAuth();

  // Fetch user data
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const res = await axiosInstance.get('/users', { params: { email: user.email } });
      return res.data.user || null;
    },
    enabled: !!user?.email,
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: isBookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['bookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosInstance.get('/bookings', { params: { userEmail: user.email } });
      return res.data.bookings || [];
    },
    enabled: !!user?.email,
  });

  // Calculate stats
  const stats = {
    totalBookings: bookings.length,
    upcomingBookings: bookings.filter((booking) => new Date(booking.date) > new Date()).length,
    membershipLevel: bookings.length > 10 ? 'Gold' : bookings.length > 5 ? 'Silver' : 'Basic',
  };

  // Show errors with SweetAlert2
  if (userError || bookingsError) {
    Swal.fire({
      title: 'Error',
      text: userError?.response?.data?.error || bookingsError?.response?.data?.error || 'Failed to load profile data',
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>

      {/* Loading State */}
      {(isUserLoading || isBookingsLoading) && (
        < Loading />
      )}

      {/* Profile Section */}
      {user && !isUserLoading && !isBookingsLoading && (
        <>
          <section className="flex flex-col sm:flex-row items-center gap-6 mb-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-300 dark:border-gray-700">
            <img
              src={user?.photoURL || 'https://via.placeholder.com/150'}
              alt="Member Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 shadow-md"
              aria-label="User profile picture"
            />
            <div className="space-y-1 text-center sm:text-left">
              <p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Name: </span>
                {user?.displayName || 'Anonymous User'}
              </p>
              <p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Email: </span>
                {user?.email}
              </p>
              <p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Member Since: </span>
                {userData?.memberSince
                  ? new Date(userData.memberSince).toLocaleDateString()
                  : 'Not a member yet'}
              </p>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md p-6 border border-gray-300 dark:border-gray-700 text-center">
              <h2 className="text-lg font-semibold mb-2">Bookings Made</h2>
              <p className="text-4xl font-bold">{stats.totalBookings}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md p-6 border border-gray-300 dark:border-gray-700 text-center">
              <h2 className="text-lg font-semibold mb-2">Upcoming Bookings</h2>
              <p className="text-4xl font-bold">{stats.upcomingBookings}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-md p-6 border border-gray-300 dark:border-gray-700 text-center">
              <h2 className="text-lg font-semibold mb-2">Membership Level</h2>
              <p className="text-4xl font-bold">{stats.membershipLevel}</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default MemberProfile;
