import { Form, useLoaderData } from '@remix-run/react';
import { 
  SearchIcon, 
  CloudIcon, 
  CloudRainIcon, 
  WindIcon, 
  ThermometerIcon, 
  DropletIcon,
  SunriseIcon,
  SunsetIcon,
  CompassIcon
} from 'lucide-react';

export async function loader({ request }): Promise<any> {
  try {
    const api = process.env.API_KEY;
    const cityname = new URL(request.url).searchParams.get('location') || 'London';
    const openweatherurl = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${api}`;
    const response = await fetch(openweatherurl);
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Response('Failed to fetch weather data', { status: 500 });
  }
}

export default function WeatherApp() {
  const weatherData: any = useLoaderData();
  const temperature = Math.round(weatherData.main.temp - 273.15);
  const feelsLike = Math.round(weatherData.main.feels_like - 273.15);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  // Convert sunrise and sunset timestamps to readable time
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const weatherDetails = [
    { icon: <CloudRainIcon className="w-6 h-6 text-teal-300" />, label: 'Cloudiness', value: `${weatherData.clouds.all}%` },
    { icon: <DropletIcon className="w-6 h-6 text-cyan-300" />, label: 'Humidity', value: `${weatherData.main.humidity}%` },
    { icon: <WindIcon className="w-6 h-6 text-emerald-300" />, label: 'Wind Speed', value: `${weatherData.wind.speed} km/h` },
    { icon: <SunriseIcon className="w-6 h-6 text-amber-300" />, label: 'Sunrise', value: formatTime(weatherData.sys.sunrise) },
    { icon: <SunsetIcon className="w-6 h-6 text-amber-400" />, label: 'Sunset', value: formatTime(weatherData.sys.sunset) },
    { icon: <CompassIcon className="w-6 h-6 text-lime-300" />, label: 'Wind Direction', value: `${weatherData.wind.deg}°` },
  ];

  // Determine weather background based on temperature
  const getWeatherBackground = () => {
    if (temperature <= 0) return 'from-slate-800 to-slate-900';
    if (temperature > 0 && temperature <= 15) return 'from-emerald-800 to-emerald-900';
    if (temperature > 15 && temperature <= 25) return 'from-teal-700 to-teal-800';
    return 'from-amber-600 to-orange-700';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getWeatherBackground()} flex items-center justify-center p-4 overflow-hidden`}>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Weather Panel */}
        <div className="md:col-span-2 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden relative">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?cs=srgb&dl=pexels-jplenio-1118873.jpg&fm=jpg')" }}
          />
          <div className="relative z-10 p-8 text-white">
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
              <CloudIcon className="w-10 h-10 text-cyan-300" />
              {weatherData.weather[0].description}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-6">
          {/* Search Bar */}
          <Form method="get" reloadDocument className="mb-6">
            <div className="flex items-center bg-white/20 rounded-full p-3 backdrop-blur-sm">
              <SearchIcon className="w-6 h-6 text-white/70 mr-3" />
              <input
                type="text"
                name="location"
                placeholder="Search location"
                className="bg-transparent text-white placeholder-white/50 outline-none w-full text-lg"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}