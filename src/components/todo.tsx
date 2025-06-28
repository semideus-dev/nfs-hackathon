"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Award, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Task {
  id: string;
  name: string;
  description: string;
  points: number;
  dueTime: string;
  completed: boolean;
  createdAt: Date;
}

const formSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  points: z
    .number()
    .min(1, "Points must be at least 1")
    .max(100, "Points cannot exceed 100"),
  dueTime: z
    .string()
    .min(1, "Due time is required")
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Please enter time in HH:MM format"
    ),
});

type FormData = z.infer<typeof formSchema>;

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [flameTimeLeft, setFlameTimeLeft] = useState(0); // in seconds
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      points: 1,
      dueTime: "",
    },
  });

  // Calculate total time left for all incomplete tasks
  const calculateTotalTimeLeft = () => {
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    let totalMinutes = 0;
    tasks.forEach((task) => {
      if (!task.completed) {
        const [hours, minutes] = task.dueTime.split(":").map(Number);
        const taskTimeMinutes = hours * 60 + minutes;
        const timeLeft = taskTimeMinutes - currentTimeMinutes;
        if (timeLeft > 0) {
          totalMinutes += timeLeft;
        }
      }
    });

    return totalMinutes * 60; // convert to seconds
  };

  // Update flame time when tasks change
  useEffect(() => {
    const totalTimeLeft = calculateTotalTimeLeft();
    if (totalTimeLeft > flameTimeLeft) {
      setFlameTimeLeft(totalTimeLeft);
    }
  }, [tasks]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setFlameTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTask = (data: FormData) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description || "",
      points: data.points,
      dueTime: data.dueTime,
      completed: false,
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
    form.reset();
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id && !task.completed) {
          // Add points as fuel when completing a task (1 point = 30 seconds of fuel)
          setFlameTimeLeft((prevTime) => prevTime + task.points * 30);
          return { ...task, completed: true };
        } else if (task.id === id && task.completed) {
          // Remove fuel when uncompleting a task
          setFlameTimeLeft((prevTime) =>
            Math.max(0, prevTime - task.points * 30)
          );
          return { ...task, completed: false };
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour24 = Number.parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatFlameTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isOverdue = (dueTimeString: string, completed: boolean) => {
    if (completed) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    return currentTime > dueTimeString;
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;
  const totalPoints = tasks.reduce(
    (sum, task) => sum + (task.completed ? task.points : 0),
    0
  );
  const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0);

  const activeTasksCount = tasks.filter((task) => !task.completed).length;
  const flameIntensity =
    activeTasksCount === 0 ? 1 : Math.min(flameTimeLeft / 300, 1);

  return (
    <div className=" text-white p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-yellow-500 bg-clip-text text-transparent mb-2">
            Spark
          </h1>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <span>
              {totalCount === 0
                ? "No tasks yet"
                : `${completedCount}/${totalCount} tasks completed`}
            </span>
            {maxPoints > 0 && (
              <span>
                {totalPoints}/{maxPoints} points earned
              </span>
            )}
          </div>
        </motion.div>

        {/* Flame Section - Top Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <Card className="bg-background border w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Motivation Flame
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {/* Animated Flame */}
              <div className="relative">
                <motion.div
                  className="flame"
                  animate={{
                    scale:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? [1, 1.1, 1]
                        : 0.3,
                    opacity:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? [0.8, 1, 0.8]
                        : 0.3,
                  }}
                  transition={{
                    duration:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? 2
                        : 0.5,
                    repeat:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? Number.POSITIVE_INFINITY
                        : 0,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: "80px",
                    height: "100px",
                    background:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? `radial-gradient(circle at 50% 100%, 
                         #ff4500 0%, 
                         #ff6b00 25%, 
                         #ff8c00 50%, 
                         #ffa500 75%, 
                         #ffff00 100%)`
                        : "#444",
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    filter:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? "blur(1px)"
                        : "none",
                  }}
                />

                {/* Inner flame */}
                <motion.div
                  className="absolute top-2 left-1/2 transform -translate-x-1/2"
                  animate={{
                    scale:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? [0.8, 1, 0.8]
                        : 0.2,
                    opacity:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? [0.9, 1, 0.9]
                        : 0.2,
                  }}
                  transition={{
                    duration:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? 1.5
                        : 0.5,
                    repeat:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? Number.POSITIVE_INFINITY
                        : 0,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                  style={{
                    width: "50px",
                    height: "70px",
                    background:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? `radial-gradient(circle at 50% 100%, 
                         #ff6b00 0%, 
                         #ff8c00 30%, 
                         #ffa500 60%, 
                         #ffff00 100%)`
                        : "#666",
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  }}
                />

                {/* Core flame */}
                <motion.div
                  className="absolute top-4 left-1/2 transform -translate-x-1/2"
                  animate={{
                    scale:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? [0.6, 0.8, 0.6]
                        : 0.1,
                    opacity:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? [1, 0.8, 1]
                        : 0.1,
                  }}
                  transition={{
                    duration:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? 1
                        : 0.5,
                    repeat:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? Number.POSITIVE_INFINITY
                        : 0,
                    ease: "easeInOut",
                    delay: 0.6,
                  }}
                  style={{
                    width: "25px",
                    height: "40px",
                    background:
                      flameTimeLeft > 0 ||
                      tasks.filter((task) => !task.completed).length === 0
                        ? "#ffff00"
                        : "#888",
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  }}
                />
              </div>

              {/* Timer - Only show when there are active tasks */}
              {tasks.filter((task) => !task.completed).length > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-orange-400 mb-2">
                    {formatFlameTime(flameTimeLeft)}
                  </div>
                  <p className="text-sm text-gray-400">
                    {flameTimeLeft > 0
                      ? "Time until flame burns out"
                      : "Flame extinguished"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Complete tasks to add fuel! (1 point = 30 seconds)
                  </p>
                </div>
              )}

              {/* Message when no active tasks */}
              {tasks.filter((task) => !task.completed).length === 0 && (
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-2">
                    🎉 All tasks completed!
                  </p>
                  <p className="text-xs text-gray-500">
                    The flame burns eternal when you're productive!
                  </p>
                </div>
              )}

              {/* Flame Status */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Flame Intensity</span>
                  <span>{Math.round(flameIntensity * 100)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-orange-600 to-yellow-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${flameIntensity * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form and Tasks Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add Task Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-background border">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Create New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(addTask)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Task Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter task name..."
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Description (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Add task description..."
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 resize-none"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="points"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Points
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                max="100"
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseInt(e.target.value) || 1
                                  )
                                }
                                className="bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dueTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Due Time (Today)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="time"
                                step="300"
                                className="bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                                placeholder="HH:MM"
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-400 to-yellow-400 cursor-pointer transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks List */}
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl font-semibold text-white mb-4"
            >
              Your Tasks
            </motion.h2>

            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  layout
                >
                  <Card
                    className={`bg-background border hover:border-gray-700 transition-all duration-200 hover:shadow-lg ${
                      isOverdue(task.dueTime, task.completed)
                        ? "border-red-500/50 hover:border-red-500"
                        : "hover:shadow-blue-500/10"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-1"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="h-5 w-5 border-2 border-gray-400 bg-gray-800 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                          />
                        </motion.div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <motion.h3
                              className={`font-semibold transition-all duration-300 ${
                                task.completed
                                  ? "text-gray-500 line-through"
                                  : "text-white"
                              }`}
                              animate={{
                                opacity: task.completed ? 0.6 : 1,
                              }}
                            >
                              {task.name}
                            </motion.h3>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-red-400/50 text-white border-red-400"
                              >
                                <Award className="h-3 w-3 mr-1" />
                                {task.points}
                              </Badge>

                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask(task.id)}
                                  className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>

                          {task.description && (
                            <motion.p
                              className={`text-sm transition-all duration-300 ${
                                task.completed
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                              animate={{
                                opacity: task.completed ? 0.5 : 1,
                              }}
                            >
                              {task.description}
                            </motion.p>
                          )}

                          <div className="flex items-center gap-4 text-xs">
                            <div
                              className={`flex items-center gap-1 ${
                                isOverdue(task.dueTime, task.completed)
                                  ? "text-red-400"
                                  : "text-gray-500"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>Due: {formatTime(task.dueTime)}</span>
                              {isOverdue(task.dueTime, task.completed) && (
                                <Badge
                                  variant="destructive"
                                  className="ml-2 text-xs"
                                >
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {tasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-400 text-lg">No tasks created yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Create your first task using the form on the left!
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Task Progress
                      </span>
                      <span className="text-sm text-gray-400">
                        {Math.round((completedCount / totalCount) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(completedCount / totalCount) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Points Progress
                      </span>
                      <span className="text-sm text-gray-400">
                        {maxPoints > 0
                          ? Math.round((totalPoints / maxPoints) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            maxPoints > 0
                              ? `${(totalPoints / maxPoints) * 100}%`
                              : "0%",
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
