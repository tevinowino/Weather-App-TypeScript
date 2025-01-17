import { LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { 
  SearchIcon, 
  CloudIcon, 
  CloudRainIcon, 
  WindIcon, 
  ThermometerIcon, 
  DropletIcon,
  SunriseIcon,
  SunsetIcon,
  CompassIcon,
  CloudSnowIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const api = process.env.API_KEY;
    let location = new URL(request.url).searchParams.get('location') 
    const cityname = location ||'London';
    const openweatherurl = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${api}`;
    const response = await fetch(openweatherurl);
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    return{ data, location};
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Response('Failed to fetch weather data', { status: 500 });
  }
}

// Skeleton Loading Component
const WeatherSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <div>
        <div className="h-12 w-32 bg-white/20 rounded mb-4"></div>
        <div className="h-6 w-24 bg-white/20 rounded mb-2"></div>
        <div className="h-6 w-40 bg-white/20 rounded"></div>
      </div>
      <div className="h-6 w-32 bg-white/20 rounded"></div>
    </div>
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-white/20 rounded-full"></div>
      <div className="h-6 w-40 bg-white/20 rounded"></div>
    </div>
  </div>
);

const WeatherDetailsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(6)].map((_, index) => (
      <div 
        key={index} 
        className="flex justify-between items-center bg-white/10 p-2 rounded-xl"
      >
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 bg-white/20 rounded-full"></div>
          <div className="h-4 w-24 bg-white/20 rounded"></div>
        </div>
        <div className="h-4 w-16 bg-white/20 rounded"></div>
      </div>
    ))}
  </div>
);

export default function WeatherApp() {
  const data = useLoaderData<typeof loader>();
  const weatherData = data.data
  const location = data.location
  console.log({weatherData: weatherData});
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation();
  console.log({navigation});

  let isSearching = Boolean(navigation.state === 'loading' && navigation.location.search);
  console.log({isSearching});

  const temperature = isSearching ? 0 : Math.round(weatherData.main.temp - 273.15);
  const feelsLike = isSearching ? 0 : Math.round(weatherData.main.feels_like - 273.15);

  let openweathericon = ` https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const weatherDetails = isSearching 
    ? [] 
    : [
    { icon: <CloudRainIcon className="w-6 h-6 text-teal-300" />, label: 'Cloudiness', value: `${weatherData.clouds.all}%` },
    { icon: <DropletIcon className="w-6 h-6 text-cyan-300" />, label: 'Humidity', value: `${weatherData.main.humidity}%` },
    { icon: <WindIcon className="w-6 h-6 text-emerald-300" />, label: 'Wind Speed', value: `${weatherData.wind.speed} km/h` },
    { icon: <SunriseIcon className="w-6 h-6 text-amber-300" />, label: 'Sunrise', value: formatTime(weatherData.sys.sunrise) },
    { icon: <SunsetIcon className="w-6 h-6 text-amber-400" />, label: 'Sunset', value: formatTime(weatherData.sys.sunset) },
    { icon: <CompassIcon className="w-6 h-6 text-lime-300" />, label: 'Wind Direction', value: `${weatherData.wind.deg}°` },
  ];

  const getWeatherBackground = () => {
    if (temperature <= 0) return 'from-slate-800 to-slate-900';
    if (temperature > 0 && temperature <= 15) return 'from-emerald-800 to-emerald-900';
    if (temperature > 15 && temperature <= 25) return 'from-teal-700 to-teal-800';
    return 'from-amber-600 to-orange-700';
  };


  return (
    <div className={`min-h-screen bg-gradient-to-br ${getWeatherBackground()} flex items-center justify-center p-4 overflow-hidden`}>
      {error && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
          <div className="bg-red-500/80 text-white px-6 py-3 rounded-xl">
            {error}
          </div>
        </div>
      )}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Weather Panel */}
        <div className="md:col-span-2 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden relative">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?cs=srgb&dl=pexels-jplenio-1118873.jpg&fm=jpg')" }}
          />
          <div className="relative z-10 p-8 text-white">
            {isSearching ? (
              <WeatherSkeleton />
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-5xl font-bold flex items-center gap-3">
                      <ThermometerIcon className="w-12 h-12 text-lime-400" />
                      {temperature}°C
                    </h2>
                    <p className="text-2xl text-gray-200 mt-2">Feels like {feelsLike}°C</p>
                    <p className="text-xl text-gray-300 mt-1">{weatherData.name}</p>
                  </div>
                  <p className="text-lg text-gray-300 text-right">{formattedDate}</p>
                </div>
                <div className="flex items-center gap-4 text-2xl capitalize">
                  <img src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} alt="" srcset="" />
                  {weatherData.weather[0].description}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-6">
          {/* Search Bar */}
          <Form method="get" className="mb-6">
            <div className="flex items-center bg-white/20 rounded-full p-3 backdrop-blur-sm">
              <SearchIcon className="w-6 h-6 text-white/70 mr-3" />
              <input
                type="text"
                name="location"
                placeholder="Search location"
                className="bg-transparent text-white placeholder-white/50 outline-none w-full text-lg"
                defaultValue={location}
              />
              <button 
                type="submit" 
                className="bg-teal-500/60 hover:bg-teal-500/80 text-white rounded-full px-5 py-2 ml-3 transition-all duration-300 ease-in-out"
              >
                Search
              </button>
            </div>
          </Form>

          {/* Weather Details */}
          <div className="space-y-4">
            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold mb-4 text-white/80 border-b border-white/20 pb-3">
                Weather Details
              </h3>
              {isSearching ? (
                <WeatherDetailsSkeleton />
              ) : (
                <div className="space-y-4">
                  {weatherDetails.map(({ icon, label, value }) => (
                    <div 
                      className="flex justify-between items-center text-white/90 hover:bg-white/10 p-2 rounded-xl transition-all duration-300 ease-in-out" 
                      key={label}
                    >
                      <div className="flex items-center gap-4">
                        {icon}
                        <span className="text-lg">{label}</span>
                      </div>
                      <span className="text-lg font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}